import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  updateAddress,
  deleteAddress,
  AddressInput,
} from "@/services/address.service";

function validate(body: unknown): { ok: true; data: AddressInput } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "Invalid request body." };
  }
  const b = body as Record<string, unknown>;

  const required = [
    "label",
    "fullName",
    "phone",
    "addressLine1",
    "city",
    "state",
    "postalCode",
  ];

  for (const field of required) {
    if (typeof b[field] !== "string" || (b[field] as string).trim().length === 0) {
      return { ok: false, error: `${field} is required.` };
    }
  }

  if (b.addressLine2 !== undefined && b.addressLine2 !== null && typeof b.addressLine2 !== "string") {
    return { ok: false, error: "Invalid address line 2." };
  }

  return {
    ok: true,
    data: {
      label: b.label as string,
      fullName: b.fullName as string,
      phone: b.phone as string,
      addressLine1: b.addressLine1 as string,
      addressLine2: (b.addressLine2 as string) ?? null,
      city: b.city as string,
      state: b.state as string,
      postalCode: b.postalCode as string,
    },
  };
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const validated = validate(body);
  if (!validated.ok) {
    return NextResponse.json({ success: false, error: validated.error }, { status: 400 });
  }

  const result = await updateAddress(session.user.id, params.id, validated.data);
  if (!result.success) {
    const status = result.error === "Address not found." ? 404 : 400;
    return NextResponse.json({ success: false, error: result.error }, { status });
  }

  return NextResponse.json({ success: true, data: result.data });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const result = await deleteAddress(session.user.id, params.id);
  if (!result.success) {
    const status = result.error === "Address not found." ? 404 : 400;
    return NextResponse.json({ success: false, error: result.error }, { status });
  }

  return NextResponse.json({ success: true });
}