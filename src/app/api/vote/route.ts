import { ActionGetResponse, ActionPostRequest, ACTIONS_CORS_HEADERS, createPostResponse } from "@solana/actions"
import { Connection, PublicKey, Transaction } from "@solana/web3.js";
import { headers } from "next/headers";
import { Voting } from "anchor/target/types/voting";
import { connection } from "next/server";
import { Anchor } from "lucide-react";
import { BN } from "@coral-xyz/anchor";
import { AnchorProvider, Program } from "@coral-xyz/anchor";


export const OPTIONS = GET;

const IDL = require("@/../anchor/target/idl/voting.json");
export async function GET(request: Request) {
    const actionMetadata: ActionGetResponse = {
        icon: "https://www.pastrywishes.com/wp-content/uploads/2021/12/peanutbutterfeatured.jpg",
        title: "Vote for your favorite type of peanut butter",
        description: "Vote between crunch or smooth peanut butter.",
        label: "Vote",
        links: {
            actions: [
                {
                    type: "post",
                    label: "Vote for Crunchy Peanut Butter",
                    href: "/api/vote?candidate=crunchy"
                },
                {
                    type: "post",
                    label: "Vote for Smooth Peanut Butter",
                    href: "/api/vote?candidate=smooth",
                }
            ]
        }
    }
    return Response.json(actionMetadata, { headers: ACTIONS_CORS_HEADERS });
}

export async function POST(request: Request) {
    const url = new URL(request.url);
    const candidate = url.searchParams.get("candidate");

    if (!candidate || (candidate !== "crunchy" && candidate !== "smooth")) {
        return Response.json({ error: "Invalid candidate" }, { status: 400, headers: ACTIONS_CORS_HEADERS });
    }

    const connection = new Connection("http://127.0.0.1:8899", "confirmed");
    const program: Program<Voting> = new Program(IDL, { connection });

    const body: ActionPostRequest = await request.json();
    var voter;
    try {
        voter = new PublicKey(body.account);
    } catch (error) {
        return new Response("Invalid account", {
            status: 400, headers:
                ACTIONS_CORS_HEADERS
        });
    }

    const instruction = await program.methods
        .vote(candidate, new BN(1))
        .accounts({
            signer: voter
            //candidate: candidate === "crunchy" ? new PublicKey("crunchyAddress") : new PublicKey("smoothAddress"),
    })
        .instruction();

    const blockhash = await connection.getLatestBlockhash();
    const transaction = new Transaction({
        feePayer: voter,
        blockhash: blockhash.blockhash,
        lastValidBlockHeight: blockhash.lastValidBlockHeight,
    }).add(instruction);

    const response = await createPostResponse({
        fields: {
            type: "transaction",
            transaction: transaction
        }
    });
    return Response.json(response, { headers: ACTIONS_CORS_HEADERS });
    // Optionally, set lastValidBlockHeight if your Transaction/SDK version supports it:
    // (transaction as any).lastValidBlockHeight = blockhash.lastValidBlockHeight;
}