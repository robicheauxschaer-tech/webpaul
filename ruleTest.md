 * // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.20;

    import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
    import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
    import "@openzeppelin/contracts/access/Ownable.sol";
    import "@openzeppelin/contracts/utils/Pausable.sol";
    import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

    /**
     * @title ptestSale
     * @notice PAULO token sale on BSC — TEST VERSION
     *
     *   PAULO decimals: 6
     *   USDT decimals:  18 (BSC)
     *
     *   Price:  0.2 USDT per PAULO  ->  1 USDT = 5 PAULO
     *   Min:    4  USDT per tx      (test: original 40)
     *   Max:    40 USDT per tx & per account cumulative  (test: original 400)
     *   Whole USDT only (no decimals)
     *
     *   Phase 1:  150 PAULO  (test boundary: 1-year lock)
     *     -> First buy  20 USDT = 100 PAULO, Phase1 remaining = 50
     *     -> Second buy 20 USDT = 100 PAULO, Phase1 fills 50 + Phase2 takes 50 ✅
     *   Phase 2: 10,000 PAULO  (test: 4-year lock)
     *
     *   Tokens release all at once after lock expires.
     *   Dynamic lock: unlockTime = purchaseTime + current lock duration
     */
    contract ptestSale is Ownable, Pausable, ReentrancyGuard {
        using SafeERC20 for IERC20;

        // ========== Structs ==========
        struct LockRecord {
            uint256 amount;        // PAULO amount (6 decimals)
            uint256 purchaseTime;  // purchase timestamp
            bool claimed;
        }

        // ========== Constants ==========
        uint256 public constant PAULO_DECIMALS = 6;
        uint256 public constant USDT_DECIMALS  = 18;

        uint256 private constant PAULO_PER_USDT_NUMERATOR = 5;
        uint256 private constant DECIMALS_DIFF = 10**12;

        // ── TEST VALUES ──────────────────────────────────────────────
        uint256 public constant MIN_PURCHASE_USDT    =  4 * 10**18;   // 4  USDT
        uint256 public constant MAX_PURCHASE_USDT    = 40 * 10**18;   // 40 USDT
        uint256 public constant MAX_PER_ACCOUNT_USDT = 40 * 10**18;   // 40 USDT
        // ─────────────────────────────────────────────────────────────

        uint256 private constant ONE_USDT = 10**18;

        // ── TEST PHASE TOTALS ────────────────────────────────────────
        // Phase1 = 150 PAULO: designed so that with 2 × 20 USDT purchases
        // the second tx straddles the Phase1/Phase2 boundary
        //   tx1: 20 USDT → 100 PAULO  (all Phase1, remaining = 50)
        //   tx2: 20 USDT → 100 PAULO  (Phase1 fills 50, Phase2 takes 50)
        uint256 public constant PHASE1_TOTAL   =       150 * 10**6;   // 150 PAULO
        uint256 public constant PHASE2_TOTAL   = 10_000 * 10**6;      // 10,000 PAULO
        // ─────────────────────────────────────────────────────────────

        uint256 public constant TOTAL_FOR_SALE = PHASE1_TOTAL + PHASE2_TOTAL;

        uint256 public constant MAX_PHASE1_LOCK = 365  days;
        uint256 public constant MAX_PHASE2_LOCK = 1460 days;

        // ========== BSC USDT (hardcoded) ==========
        IERC20 public constant usdtToken =
            IERC20(0x55d398326f99059fF775485246999027B3197955);

        // ========== State ==========
        IERC20  public pauloToken;       // set via setPauloToken()

        address public receiverWallet;
        bool    public saleActive;

        uint256 public phase1Sold;
        uint256 public phase2Sold;
        uint256 public totalUsdtRaised;
        uint256 public totalClaimed;

        uint256 public phase1LockDuration = 365  days;
        uint256 public phase2LockDuration = 1460 days;

        // ========== Mappings ==========
        mapping(address => uint256)      public  userSpentUsdt;
        mapping(address => LockRecord[]) private _userPhase1Locks;
        mapping(address => LockRecord[]) private _userPhase2Locks;

        // ========== Events ==========
        event TokensPurchased(
            address indexed buyer,
            uint256 usdtAmount,
            uint256 phase1Amount,
            uint256 phase2Amount
        );
        event Phase1Claimed(address indexed user, uint256 index, uint256 amount);
        event Phase2Claimed(address indexed user, uint256 index, uint256 amount);
        event ReceiverWalletChanged(address indexed oldWallet, address indexed newWallet);
        event SaleStatusChanged(bool active);
        event LockDurationChanged(uint256 newPhase1, uint256 newPhase2);
        event UnsoldTokensWithdrawn(address indexed to, uint256 amount);
        event PauloTokenSet(address indexed oldToken, address indexed newToken);

        // ========== Constructor ==========
        constructor() Ownable(msg.sender) {
            receiverWallet = msg.sender;
            saleActive     = false;
        }

        // ========== Admin: Set PAULO Token ==========

        /**
         * @notice Bind (or update) the PAULO token address.
         *         Must be called before activating the sale.
         */
        function setPauloToken(address _pauloToken) external onlyOwner {
            require(_pauloToken != address(0), "Invalid PAULO address");
            address old = address(pauloToken);
            pauloToken  = IERC20(_pauloToken);
            emit PauloTokenSet(old, _pauloToken);
        }

        // ========== Internal Helpers ==========

        function _phase1UnlockTime(LockRecord storage r) internal view returns (uint256) {
            return r.purchaseTime + phase1LockDuration;
        }

        function _phase2UnlockTime(LockRecord storage r) internal view returns (uint256) {
            return r.purchaseTime + phase2LockDuration;
        }

        // ========== Purchase ==========

        function buy(uint256 usdtAmount) external whenNotPaused nonReentrant {
            require(saleActive,                          "Sale not active");
            require(address(pauloToken) != address(0),  "PAULO token not set");
            require(usdtAmount >= MIN_PURCHASE_USDT,     "Below min 4 USDT");
            require(usdtAmount <= MAX_PURCHASE_USDT,     "Above max 40 USDT");
            require(usdtAmount % ONE_USDT == 0,          "Whole USDT only");
            require(
                userSpentUsdt[msg.sender] + usdtAmount <= MAX_PER_ACCOUNT_USDT,
                "Exceeds 40 USDT limit"
            );

        ​    uint256 totalPaulo = (usdtAmount * PAULO_PER_USDT_NUMERATOR) / DECIMALS_DIFF;
        ​    require(totalPaulo > 0, "Zero PAULO");

        ​    uint256 totalRemaining = TOTAL_FOR_SALE - phase1Sold - phase2Sold;
        ​    require(totalRemaining >= totalPaulo, "Insufficient tokens");

        ​    uint256 phase1Remaining = PHASE1_TOTAL - phase1Sold;
        ​    uint256 p1Amount;
        ​    uint256 p2Amount;

        ​    if (phase1Remaining >= totalPaulo) {
        ​        p1Amount = totalPaulo;
        ​        p2Amount = 0;
        ​    } else {
        ​        p1Amount = phase1Remaining;
        ​        p2Amount = totalPaulo - phase1Remaining;
        ​    }

        ​    userSpentUsdt[msg.sender] += usdtAmount;
        ​    totalUsdtRaised            += usdtAmount;

        ​    if (p1Amount > 0) {
        ​        phase1Sold += p1Amount;
        ​        _userPhase1Locks[msg.sender].push(LockRecord({
        ​            amount:       p1Amount,
        ​            purchaseTime: block.timestamp,
        ​            claimed:      false
        ​        }));
        ​    }

        ​    if (p2Amount > 0) {
        ​        phase2Sold += p2Amount;
        ​        _userPhase2Locks[msg.sender].push(LockRecord({
        ​            amount:       p2Amount,
        ​            purchaseTime: block.timestamp,
        ​            claimed:      false
        ​        }));
        ​    }

        ​    usdtToken.safeTransferFrom(msg.sender, receiverWallet, usdtAmount);

        ​    emit TokensPurchased(msg.sender, usdtAmount, p1Amount, p2Amount);
        }

        // ========== Claim ==========

        function claimPhase1(uint256 index) external nonReentrant {
            require(address(pauloToken) != address(0), "PAULO token not set");
            LockRecord[] storage locks = _userPhase1Locks[msg.sender];
            require(index < locks.length,  "Invalid index");
            LockRecord storage record = locks[index];
            require(!record.claimed,       "Already claimed");
            require(block.timestamp >= _phase1UnlockTime(record), "Still locked");

        ​    record.claimed   = true;
        ​    totalClaimed     += record.amount;
        ​    pauloToken.safeTransfer(msg.sender, record.amount);
        ​    emit Phase1Claimed(msg.sender, index, record.amount);
        }

        function claimPhase2(uint256 index) external nonReentrant {
            require(address(pauloToken) != address(0), "PAULO token not set");
            LockRecord[] storage locks = _userPhase2Locks[msg.sender];
            require(index < locks.length,  "Invalid index");
            LockRecord storage record = locks[index];
            require(!record.claimed,       "Already claimed");
            require(block.timestamp >= _phase2UnlockTime(record), "Still locked");

        ​    record.claimed   = true;
        ​    totalClaimed     += record.amount;
        ​    pauloToken.safeTransfer(msg.sender, record.amount);
        ​    emit Phase2Claimed(msg.sender, index, record.amount);
        }

        function claimAllPhase1() external nonReentrant {
            require(address(pauloToken) != address(0), "PAULO token not set");
            LockRecord[] storage locks = _userPhase1Locks[msg.sender];
            uint256 total = 0;
            for (uint256 i = 0; i < locks.length; i++) {
                if (!locks[i].claimed && block.timestamp >= _phase1UnlockTime(locks[i])) {
                    locks[i].claimed = true;
                    total += locks[i].amount;
                    emit Phase1Claimed(msg.sender, i, locks[i].amount);
                }
            }
            require(total > 0, "Nothing to claim");
            totalClaimed += total;
            pauloToken.safeTransfer(msg.sender, total);
        }

        function claimAllPhase2() external nonReentrant {
            require(address(pauloToken) != address(0), "PAULO token not set");
            LockRecord[] storage locks = _userPhase2Locks[msg.sender];
            uint256 total = 0;
            for (uint256 i = 0; i < locks.length; i++) {
                if (!locks[i].claimed && block.timestamp >= _phase2UnlockTime(locks[i])) {
                    locks[i].claimed = true;
                    total += locks[i].amount;
                    emit Phase2Claimed(msg.sender, i, locks[i].amount);
                }
            }
            require(total > 0, "Nothing to claim");
            totalClaimed += total;
            pauloToken.safeTransfer(msg.sender, total);
        }

        // ========== Admin ==========

        function setSaleActive(bool _active) external onlyOwner {
            if (_active) {
                require(address(pauloToken) != address(0), "PAULO token not set");
            }
            saleActive = _active;
            emit SaleStatusChanged(_active);
        }

        function setReceiverWallet(address _wallet) external onlyOwner {
            require(_wallet != address(0), "Zero address");
            address old    = receiverWallet;
            receiverWallet = _wallet;
            emit ReceiverWalletChanged(old, _wallet);
        }

        /**
         * @notice Update lock durations; affects all unclaimed records immediately.
         *         Cannot exceed the maximum allowed values.
         */
        function setLockDurations(uint256 newPhase1, uint256 newPhase2) external onlyOwner {
            require(newPhase1 <= MAX_PHASE1_LOCK, "Phase1 exceeds max");
            require(newPhase2 <= MAX_PHASE2_LOCK, "Phase2 exceeds max");
            phase1LockDuration = newPhase1;
            phase2LockDuration = newPhase2;
            emit LockDurationChanged(newPhase1, newPhase2);
        }

        function withdrawUnsoldTokens(address to) external onlyOwner {
            require(!saleActive,                         "Sale still active");
            require(to != address(0),                    "Zero address");
            require(address(pauloToken) != address(0),  "PAULO token not set");

        ​    uint256 balance     = pauloToken.balanceOf(address(this));
        ​    uint256 unclaimed   = (phase1Sold + phase2Sold) - totalClaimed;
        ​    require(balance > unclaimed, "Nothing to withdraw");

        ​    uint256 withdrawable = balance - unclaimed;
        ​    pauloToken.safeTransfer(to, withdrawable);
        ​    emit UnsoldTokensWithdrawn(to, withdrawable);
        }

        function pause()   external onlyOwner { _pause(); }
        function unpause() external onlyOwner { _unpause(); }

        // ========== View: User Locks ==========

        function getUserPhase1Locks(address user) external view returns (LockRecord[] memory) {
            return _userPhase1Locks[user];
        }

        function getUserPhase2Locks(address user) external view returns (LockRecord[] memory) {
            return _userPhase2Locks[user];
        }

        function getPhase1TimeRemaining(address user, uint256 index) external view returns (uint256) {
            require(index < _userPhase1Locks[user].length, "Invalid index");
            uint256 ut = _userPhase1Locks[user][index].purchaseTime + phase1LockDuration;
            return block.timestamp >= ut ? 0 : ut - block.timestamp;
        }

        function getPhase2TimeRemaining(address user, uint256 index) external view returns (uint256) {
            require(index < _userPhase2Locks[user].length, "Invalid index");
            uint256 ut = _userPhase2Locks[user][index].purchaseTime + phase2LockDuration;
            return block.timestamp >= ut ? 0 : ut - block.timestamp;
        }

        // ========== View: User Summary ==========

        function getUserSummary(address user) external view returns (
            uint256 totalSpentUsdt,
            uint256 remainingUsdtQuota,
            uint256 phase1Locked,
            uint256 phase1Claimable,
            uint256 phase1AlreadyClaimed,
            uint256 phase1EarliestUnlock,
            uint256 phase2Locked,
            uint256 phase2Claimable,
            uint256 phase2AlreadyClaimed,
            uint256 phase2EarliestUnlock
        ) {
            totalSpentUsdt     = userSpentUsdt[user];
            remainingUsdtQuota = MAX_PER_ACCOUNT_USDT > userSpentUsdt[user]
                ? MAX_PER_ACCOUNT_USDT - userSpentUsdt[user] : 0;

        ​    phase1EarliestUnlock = type(uint256).max;
        ​    LockRecord[] storage p1 = _userPhase1Locks[user];
        ​    for (uint256 i = 0; i < p1.length; i++) {
        ​        uint256 ut1 = p1[i].purchaseTime + phase1LockDuration;
        ​        if (p1[i].claimed) {
        ​            phase1AlreadyClaimed += p1[i].amount;
        ​        } else if (block.timestamp >= ut1) {
        ​            phase1Claimable += p1[i].amount;
        ​        } else {
        ​            phase1Locked += p1[i].amount;
        ​            if (ut1 < phase1EarliestUnlock) phase1EarliestUnlock = ut1;
        ​        }
        ​    }
        ​    if (phase1EarliestUnlock == type(uint256).max) phase1EarliestUnlock = 0;

        ​    phase2EarliestUnlock = type(uint256).max;
        ​    LockRecord[] storage p2 = _userPhase2Locks[user];
        ​    for (uint256 i = 0; i < p2.length; i++) {
        ​        uint256 ut2 = p2[i].purchaseTime + phase2LockDuration;
        ​        if (p2[i].claimed) {
        ​            phase2AlreadyClaimed += p2[i].amount;
        ​        } else if (block.timestamp >= ut2) {
        ​            phase2Claimable += p2[i].amount;
        ​        } else {
        ​            phase2Locked += p2[i].amount;
        ​            if (ut2 < phase2EarliestUnlock) phase2EarliestUnlock = ut2;
        ​        }
        ​    }
        ​    if (phase2EarliestUnlock == type(uint256).max) phase2EarliestUnlock = 0;
        }

        // ========== View: Sale Info ==========

        function getSaleInfo() external view returns (
            uint256 _phase1Sold,
            uint256 _phase1Remaining,
            uint256 _phase2Sold,
            uint256 _phase2Remaining,
            uint256 _totalSold,
            uint256 _totalRemaining,
            uint256 _totalUsdtRaised,
            bool    _saleActive,
            uint256 _phase1LockDuration,
            uint256 _phase2LockDuration
        ) {
            _phase1Sold         = phase1Sold;
            _phase1Remaining    = PHASE1_TOTAL - phase1Sold;
            _phase2Sold         = phase2Sold;
            _phase2Remaining    = PHASE2_TOTAL - phase2Sold;
            _totalSold          = phase1Sold + phase2Sold;
            _totalRemaining     = TOTAL_FOR_SALE - phase1Sold - phase2Sold;
            _totalUsdtRaised    = totalUsdtRaised;
            _saleActive         = saleActive;
            _phase1LockDuration = phase1LockDuration;
            _phase2LockDuration = phase2LockDuration;
        }
    }
