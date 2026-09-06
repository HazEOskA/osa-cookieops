use anchor_lang::prelude::*;

// Development placeholder only. Generate and lock the final program id before deploy.
declare_id!("Fg6PaFpoGXkYsidMpWxTWqkZtM7FhS1SnmKrN6Z2yY");

#[program]
pub mod osa_intent {
    use super::*;

    pub fn create_intent(
        ctx: Context<CreateIntent>,
        nonce: u64,
        action_type: u8,
        payload_hash: [u8; 32],
        expires_at: i64,
    ) -> Result<()> {
        let clock = Clock::get()?;
        require!(expires_at > clock.unix_timestamp, CookieOpsError::InvalidExpiry);

        let intent = &mut ctx.accounts.intent;
        intent.owner = ctx.accounts.owner.key();
        intent.nonce = nonce;
        intent.action_type = action_type;
        intent.payload_hash = payload_hash;
        intent.status = IntentStatus::Proposed;
        intent.created_at = clock.unix_timestamp;
        intent.created_slot = clock.slot;
        intent.expires_at = expires_at;
        intent.approved_at = 0;
        intent.executed_at = 0;
        intent.executed_slot = 0;
        intent.bump = ctx.bumps.intent;

        emit!(IntentCreated {
            owner: intent.owner,
            nonce,
            action_type,
            payload_hash,
            expires_at,
        });
        Ok(())
    }

    pub fn approve_intent(ctx: Context<MutateIntent>) -> Result<()> {
        let clock = Clock::get()?;
        let intent = &mut ctx.accounts.intent;
        intent.assert_not_expired(clock.unix_timestamp)?;
        require!(intent.status == IntentStatus::Proposed, CookieOpsError::InvalidTransition);

        intent.status = IntentStatus::Approved;
        intent.approved_at = clock.unix_timestamp;
        emit!(IntentApproved {
            owner: intent.owner,
            nonce: intent.nonce,
        });
        Ok(())
    }

    pub fn execute_intent(ctx: Context<MutateIntent>) -> Result<()> {
        let clock = Clock::get()?;
        let intent = &mut ctx.accounts.intent;
        intent.assert_not_expired(clock.unix_timestamp)?;
        require!(intent.status == IntentStatus::Approved, CookieOpsError::InvalidTransition);

        intent.status = IntentStatus::Executed;
        intent.executed_at = clock.unix_timestamp;
        intent.executed_slot = clock.slot;
        emit!(IntentExecuted {
            owner: intent.owner,
            nonce: intent.nonce,
            slot: clock.slot,
        });
        Ok(())
    }

    pub fn cancel_intent(ctx: Context<MutateIntent>) -> Result<()> {
        let intent = &mut ctx.accounts.intent;
        require!(
            intent.status == IntentStatus::Proposed || intent.status == IntentStatus::Approved,
            CookieOpsError::InvalidTransition
        );
        intent.status = IntentStatus::Cancelled;
        emit!(IntentCancelled {
            owner: intent.owner,
            nonce: intent.nonce,
        });
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(nonce: u64)]
pub struct CreateIntent<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        init,
        payer = owner,
        space = 8 + IntentAccount::INIT_SPACE,
        seeds = [b"intent", owner.key().as_ref(), &nonce.to_le_bytes()],
        bump
    )]
    pub intent: Account<'info, IntentAccount>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct MutateIntent<'info> {
    pub owner: Signer<'info>,

    #[account(
        mut,
        has_one = owner @ CookieOpsError::Unauthorized,
        seeds = [b"intent", owner.key().as_ref(), &intent.nonce.to_le_bytes()],
        bump = intent.bump
    )]
    pub intent: Account<'info, IntentAccount>,
}

#[account]
#[derive(InitSpace)]
pub struct IntentAccount {
    pub owner: Pubkey,
    pub nonce: u64,
    pub action_type: u8,
    pub payload_hash: [u8; 32],
    pub status: IntentStatus,
    pub created_at: i64,
    pub created_slot: u64,
    pub expires_at: i64,
    pub approved_at: i64,
    pub executed_at: i64,
    pub executed_slot: u64,
    pub bump: u8,
}

impl IntentAccount {
    fn assert_not_expired(&self, now: i64) -> Result<()> {
        require!(now <= self.expires_at, CookieOpsError::IntentExpired);
        Ok(())
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace)]
pub enum IntentStatus {
    Proposed,
    Approved,
    Executed,
    Cancelled,
}

#[event]
pub struct IntentCreated {
    pub owner: Pubkey,
    pub nonce: u64,
    pub action_type: u8,
    pub payload_hash: [u8; 32],
    pub expires_at: i64,
}

#[event]
pub struct IntentApproved {
    pub owner: Pubkey,
    pub nonce: u64,
}

#[event]
pub struct IntentExecuted {
    pub owner: Pubkey,
    pub nonce: u64,
    pub slot: u64,
}

#[event]
pub struct IntentCancelled {
    pub owner: Pubkey,
    pub nonce: u64,
}

#[error_code]
pub enum CookieOpsError {
    #[msg("Intent expiry must be in the future")]
    InvalidExpiry,
    #[msg("Intent has expired")]
    IntentExpired,
    #[msg("Invalid intent state transition")]
    InvalidTransition,
    #[msg("Signer is not the intent owner")]
    Unauthorized,
}
