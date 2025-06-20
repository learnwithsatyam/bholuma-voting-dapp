#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("FqzkXZdwYjurnUKetJCAvaUw5WAqbwzU6gZEwydeEfqS");

#[program]
pub mod voting {
    use anchor_lang::solana_program::entrypoint::ProgramResult;

    use super::*;

    pub fn initialize_poll(ctx: Context<InitializePoll>, poll_id: u64) -> Result<()>{
        Ok(())
    }
}


#[derive(Accounts)]
pub struct InitializePoll<'info>{

    
}
