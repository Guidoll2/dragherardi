import { NextRequest, NextResponse } from "next/server";
import db from "../../../../mongoDB/db";
import User from "@/mongoDB/models/users";

interface UserUpdateData {
  clerkUserId: string;
  imageUrl: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phoneNumber: string | null;
}

export async function POST(req: NextRequest) {
  try {
    await db();
    const event = await req.json();
    console.log("Evento recibido:", event);

    switch (event.type) {
      case "user.created":
      case "user.updated": {
        const userData = event.data;
        const {
          id,
          profile_image_url,
          first_name,
          last_name,
          email_addresses,
          phone_numbers,
        } = userData;

        console.log("Datos del usuario:", userData);

        const email = email_addresses?.[0]?.email_address ?? null;
        const phoneNumber = phone_numbers?.[0]?.phone_number ?? null;

        console.log("Email extraído:", email);
        console.log("Número de celular extraído:", phoneNumber);

        const userUpdateData: UserUpdateData = {
          clerkUserId: id,
          imageUrl: profile_image_url,
          firstName: first_name,
          lastName: last_name,
          email: email,
          phoneNumber: phoneNumber,
        };

        console.log("Datos a actualizar:", userUpdateData);

        await User.findOneAndUpdate({ clerkUserId: id }, userUpdateData, {
          upsert: true,
          new: true,
        });
        break;
      }
      default:
        console.log("Evento ignorado:", event.type);
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error handling webhook:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
