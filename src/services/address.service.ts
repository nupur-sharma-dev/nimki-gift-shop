import { prisma } from "@/lib/prisma";

const MAX_ADDRESSES = 5;

export interface AddressInput {
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  city: string;
  state: string;
  postalCode: string;
}

export async function getAddresses(userId: string) {
  try {
    return await prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
  } catch (error) {
    console.error("[address.service] getAddresses failed:", error);
    return [];
  }
}

export async function getAddressById(userId: string, id: string) {
  try {
    const address = await prisma.address.findUnique({ where: { id } });
    if (!address || address.userId !== userId) return null;
    return address;
  } catch (error) {
    console.error("[address.service] getAddressById failed:", error);
    return null;
  }
}

export async function createAddress(
  userId: string,
  data: AddressInput
): Promise<{ success: boolean; error?: string; data?: unknown }> {
  try {
    const count = await prisma.address.count({ where: { userId } });
    if (count >= MAX_ADDRESSES) {
      return {
        success: false,
        error: `You can save up to ${MAX_ADDRESSES} addresses only.`,
      };
    }

    const isFirst = count === 0;

    const created = await prisma.address.create({
      data: {
        userId,
        label: data.label.trim(),
        fullName: data.fullName.trim(),
        phone: data.phone.trim(),
        addressLine1: data.addressLine1.trim(),
        addressLine2: data.addressLine2?.trim() || null,
        city: data.city.trim(),
        state: data.state.trim(),
        postalCode: data.postalCode.trim(),
        isDefault: isFirst,
      },
    });

    return { success: true, data: created };
  } catch (error) {
    console.error("[address.service] createAddress failed:", error);
    return { success: false, error: "Could not create address." };
  }
}

export async function updateAddress(
  userId: string,
  id: string,
  data: AddressInput
): Promise<{ success: boolean; error?: string; data?: unknown }> {
  try {
    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return { success: false, error: "Address not found." };
    }

    const updated = await prisma.address.update({
      where: { id },
      data: {
        label: data.label.trim(),
        fullName: data.fullName.trim(),
        phone: data.phone.trim(),
        addressLine1: data.addressLine1.trim(),
        addressLine2: data.addressLine2?.trim() || null,
        city: data.city.trim(),
        state: data.state.trim(),
        postalCode: data.postalCode.trim(),
      },
    });

    return { success: true, data: updated };
  } catch (error) {
    console.error("[address.service] updateAddress failed:", error);
    return { success: false, error: "Could not update address." };
  }
}

export async function deleteAddress(
  userId: string,
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return { success: false, error: "Address not found." };
    }

    const wasDefault = existing.isDefault;

    await prisma.address.delete({ where: { id } });

    if (wasDefault) {
      const next = await prisma.address.findFirst({
        where: { userId },
        orderBy: { createdAt: "desc" },
      });
      if (next) {
        await prisma.address.update({
          where: { id: next.id },
          data: { isDefault: true },
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error("[address.service] deleteAddress failed:", error);
    return { success: false, error: "Could not delete address." };
  }
}

export async function setDefaultAddress(
  userId: string,
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const existing = await prisma.address.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId) {
      return { success: false, error: "Address not found." };
    }
    if (existing.isDefault) return { success: true };

    await prisma.$transaction([
      prisma.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      }),
      prisma.address.update({
        where: { id },
        data: { isDefault: true },
      }),
    ]);

    return { success: true };
  } catch (error) {
    console.error("[address.service] setDefaultAddress failed:", error);
    return { success: false, error: "Could not set default address." };
  }
}

export { MAX_ADDRESSES };