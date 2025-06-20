import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair, PublicKey } from '@solana/web3.js'
import {Voting} from '../target/types/voting'
import { describe, it } from 'node:test'
import { startAnchor } from 'solana-bankrun';
import {BankrunProvider} from 'anchor-bankrun';
import { expect } from 'expect';


const IDL = require('../target/idl/voting.json')
const votingAddress = new PublicKey("FqzkXZdwYjurnUKetJCAvaUw5WAqbwzU6gZEwydeEfqS");


describe('voting', () => {
  

  it('Initialize Poll', async () => {
    const context = await startAnchor("",[{name: "voting", programId: votingAddress}], [])
    const provider = new BankrunProvider(context);

    const votingProgram = new Program<Voting>(IDL, provider);
    await votingProgram.methods.initializePoll(
      new anchor.BN(1),
      "desc",
      new anchor.BN(10),
      new anchor.BN(1000),
      new anchor.BN(1000),

    ).rpc();

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8)],
      votingAddress
    );

    const poll = await votingProgram.account.poll.fetch(pollAddress);
    console.log("Poll Address:", poll);

    expect(poll.pollId.toNumber()).toBe(1);
    expect(poll.description).toBe("desc");
    expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber());
  })

  
})
