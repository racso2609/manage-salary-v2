import { ApiKey } from "@/types/ApiKey";
import { DbRepository } from ".";
import ApiKeySchema from "@/models/apiKey";
import crypto from "crypto";

class ApiKeyDbHandler extends DbRepository<ApiKey> {
  constructor() {
    super(ApiKeySchema);
  }

  generateKey() {
    const plain = crypto.randomBytes(32).toString("hex");
    const hash = crypto.createHash("sha256").update(plain).digest("hex");
    return { plain, hash };
  }

  async createApiKey(data: { user: string; name: string; key: string; permissions?: string[]; expiresAt?: Date }) {
    return super.create(data as any);
  }

  findByUser(userId: string) {
    return this.find({ user: userId, active: true });
  }

  async findByHashedKey(hashedKey: string) {
    return await this.findOne({ key: hashedKey, active: true });
  }
}

export const ApiKeyHandler = new ApiKeyDbHandler();