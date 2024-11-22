;; Simplified Decentralized Prediction Market for Software Development

;; Constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-deadline-passed (err u103))
(define-constant err-market-not-resolved (err u104))

;; Data Maps
(define-map markets
  { market-id: uint }
  {
    creator: principal,
    description: (string-ascii 256),
    deadline: uint,
    resolved: bool,
    winning-option: (optional uint)
  }
)

(define-map market-stakes
  { market-id: uint, user: principal }
  {
    yes-stake: uint,
    no-stake: uint
  }
)

;; Variables
(define-data-var last-market-id uint u0)

;; Public Functions
(define-public (create-market (description (string-ascii 256)) (deadline uint))
  (let
    (
      (new-market-id (+ (var-get last-market-id) u1))
    )
    (map-set markets { market-id: new-market-id }
      {
        creator: tx-sender,
        description: description,
        deadline: deadline,
        resolved: false,
        winning-option: none
      }
    )
    (var-set last-market-id new-market-id)
    (ok new-market-id)
  )
)

(define-public (place-bet (market-id uint) (bet-on-yes bool) (amount uint))
  (let
    (
      (market (unwrap! (map-get? markets { market-id: market-id }) err-not-found))
      (user-stake (default-to { yes-stake: u0, no-stake: u0 }
                    (map-get? market-stakes { market-id: market-id, user: tx-sender })))
    )
    (asserts! (< block-height (get deadline market)) err-deadline-passed)
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    (map-set market-stakes { market-id: market-id, user: tx-sender }
      (merge user-stake
        {
          yes-stake: (if bet-on-yes (+ (get yes-stake user-stake) amount) (get yes-stake user-stake)),
          no-stake: (if (not bet-on-yes) (+ (get no-stake user-stake) amount) (get no-stake user-stake))
        }
      )
    )
    (ok true)
  )
)

(define-public (resolve-market (market-id uint) (outcome bool))
  (let
    (
      (market (unwrap! (map-get? markets { market-id: market-id }) err-not-found))
    )
    (asserts! (is-eq (get creator market) tx-sender) err-unauthorized)
    (asserts! (>= block-height (get deadline market)) err-deadline-passed)
    (map-set markets { market-id: market-id }
      (merge market
        {
          resolved: true,
          winning-option: (some (if outcome u1 u0))
        }
      )
    )
    (ok true)
  )
)

(define-public (claim-winnings (market-id uint))
  (let
    (
      (market (unwrap! (map-get? markets { market-id: market-id }) err-not-found))
      (user-stake (unwrap! (map-get? market-stakes { market-id: market-id, user: tx-sender }) err-not-found))
    )
    (asserts! (get resolved market) err-market-not-resolved)
    (let
      (
        (winning-option (unwrap! (get winning-option market) err-market-not-resolved))
        (winning-stake (if (is-eq winning-option u1)
                          (get yes-stake user-stake)
                          (get no-stake user-stake)))
      )
      (if (> winning-stake u0)
        (begin
          (try! (as-contract (stx-transfer? winning-stake tx-sender tx-sender)))
          (map-set market-stakes { market-id: market-id, user: tx-sender }
            { yes-stake: u0, no-stake: u0 }
          )
          (ok winning-stake)
        )
        (ok u0)
      )
    )
  )
)

;; Read-only Functions
(define-read-only (get-market (market-id uint))
  (map-get? markets { market-id: market-id })
)

(define-read-only (get-user-stake (market-id uint) (user principal))
  (map-get? market-stakes { market-id: market-id, user: user })
)

