import { ActionGetResponse, ActionPostRequest, ACTIONS_CORS_HEADERS, createPostResponse } from "@solana/actions";

import { Voting } from "@/../anchor/target/types/voting";
import { BN, Program } from "@coral-xyz/anchor";
import { Connection, PublicKey, Transaction } from "@solana/web3.js";

const IDL = require('@/../anchor/target/idl/voting.json');

export async function GET(request: Request) {
  const actionMetadata: ActionGetResponse = {
    icon: "https://cdn.awsli.com.br/2500x2500/2488/2488892/produto/264706927/peanut-butter-vegan-1556206811-i764wgjsi0.jpg",
    title: "Vote for your favorite peanut butter",
    description: "Vote between crunchy and smooth peanut butter",
    label: "Vote",
    links: {
      actions: [
        {
          label: "Vote for Crunchy",
          href: "/api/vote?candidate=Crunchy",
          type: "post"
        },
        {
          label: "Vote for Smooth",
          href: "/api/vote?candidate=Smooth",
          type: "post"
        }
      ],
    }
  }
  return Response.json(actionMetadata, { headers: ACTIONS_CORS_HEADERS });
}

export async function POST(request :Request) {
  const url = new URL(request.url);
  const candidate = url.searchParams.get("candidate");
  if (candidate === "Crunchy" || candidate === "Smooth") {
    return new Response("Invalid candidate", { status: 400, headers: ACTIONS_CORS_HEADERS });
  }

  const connection = new Connection("http://127.0.0.1:8899", "confirmed");
  const program: Program<Voting> = new Program(IDL, { connection });

  const body: ActionPostRequest = await request.json();
  let voter;

  try {
    voter = new PublicKey(body.account);
  } catch (error) {
    return new Response("Invalid account", { status: 400, headers: ACTIONS_CORS_HEADERS });
  }
  const candidateValue = candidate ?? "";
  const instruction = await program.methods.vote(candidateValue, new BN(1))
  .accounts({
    signer: voter,
  }).instruction();

  const blockhash = await connection.getLatestBlockhash();

  const transaction = new Transaction({
    feePayer: voter,
    blockhash: blockhash.blockhash,
    lastValidBlockHeight: blockhash.lastValidBlockHeight,
  }).add(instruction);
  
  
  const response = await createPostResponse({
   fields: {
    transaction,
   },
  });

  return Response.json(response, { headers: ACTIONS_CORS_HEADERS });
}