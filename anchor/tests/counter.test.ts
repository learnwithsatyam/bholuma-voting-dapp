import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Keypair, PublicKey } from '@solana/web3.js'
import { Voting } from '../target/types/voting'
import { beforeAll, afterAll, describe, it, expect } from '@jest/globals';
import { startAnchor } from 'solana-bankrun';
import { BankrunProvider } from 'anchor-bankrun';


const IDL = require('../target/idl/voting.json')
const votingAddress = new PublicKey("FqzkXZdwYjurnUKetJCAvaUw5WAqbwzU6gZEwydeEfqS");


describe('voting', () => {

  let context;
  let provider;

  let votingProgram: Program<Voting>;

  beforeAll(async () => {
    context = await startAnchor("",[{name: "voting", programId: votingAddress}], [])
    provider = new BankrunProvider(context);

    votingProgram = new Program<Voting>(IDL, provider);
  })

   it('Initialize Poll', async () => {

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

  it('initialize Candidtate', async () => {
    await votingProgram.methods.initializeCandidate(
      "crunchy",
      new anchor.BN(1),
    ).rpc();

    await votingProgram.methods.initializeCandidate(
      "smooth",
      new anchor.BN(1),
    ).rpc();

    const [crunchyAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8), Buffer.from("crunchy")],
      votingAddress
    );

    const crunchyCandidate = await votingProgram.account.candidate.fetch(crunchyAddress);
    console.log("Crunchy Candidate:", crunchyCandidate);
    const [smoothAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8), Buffer.from("smooth")],
      votingAddress
    );
    const smoothCandidate = await votingProgram.account.candidate.fetch(smoothAddress);
    console.log("Smooth Candidate:", smoothCandidate);

    expect(crunchyCandidate.candidateVotes.toNumber()).toBe(0);
    expect(smoothCandidate.candidateVotes.toNumber()).toBe(0);

  })

  it('vote', async () => {
    await votingProgram.methods.vote(
      "crunchy",
      new anchor.BN(1),
    ).rpc();

    const [crunchyAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, "le", 8), Buffer.from("crunchy")],
      votingAddress
    );
    const crunchyCandidate = await votingProgram.account.candidate.fetch(crunchyAddress);
    console.log("Crunchy Candidate After Vote:", crunchyCandidate);
    expect(crunchyCandidate.candidateVotes.toNumber()).toBe(1);
  })
})
