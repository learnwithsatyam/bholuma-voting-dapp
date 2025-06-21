import { ActionGetResponse, ActionPostRequest, ACTIONS_CORS_HEADERS } from "@solana/actions"
import { Connection, PublicKey } from "@solana/web3.js";
import { headers } from "next/headers";
import { Voting } from "anchor/target/types/voting";

export const OPTIONS = GET;

const IDL = require("@/../anchor/target/idl/vote.json");

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
}