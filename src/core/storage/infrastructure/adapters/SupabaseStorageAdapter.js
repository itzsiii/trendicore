import { StorageRepository } from '../../application/StorageRepository';

export class SupabaseStorageAdapter extends StorageRepository {
  constructor(supabaseAdminClient) {
    super();
    this.client = supabaseAdminClient;
    this.bucketName = 'product-images';
  }

  async uploadImage(fileName, buffer, contentType) {
    const { error } = await this.client.storage
      .from(this.bucketName)
      .upload(fileName, buffer, {
        contentType,
      });

    if (error) {
      throw new Error(error.message);
    }
  }

  getPublicUrl(fileName) {
    const { data } = this.client.storage
      .from(this.bucketName)
      .getPublicUrl(fileName);
      
    return data.publicUrl;
  }
}
