export class UploadProductImageUseCase {
  constructor(storageRepository) {
    this.storageRepository = storageRepository;
  }

  async execute(file) {
    if (!file) {
      throw new Error('No file provided');
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    await this.storageRepository.uploadImage(fileName, buffer, file.type);
    
    const url = this.storageRepository.getPublicUrl(fileName);
    
    return { url };
  }
}
