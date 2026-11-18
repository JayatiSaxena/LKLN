import { supabase } from "../../supabase";

export const storageService = {
  /**
   * Upload a file to a Supabase storage bucket
   */
  async uploadFile(bucket: string, path: string, file: File | Blob) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) throw error;
    return data;
  },

  /**
   * Get a public URL for a file in a bucket
   */
  getPublicUrl(bucket: string, path: string) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  },

  /**
   * Delete a file from a bucket
   */
  async deleteFile(bucket: string, path: string) {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw error;
  },

  /**
   * Create a bucket if it doesn't exist (Requires Admin/Auth with permission)
   */
  async ensureBucket(bucket: string) {
    const { data: buckets, error: getError } = await supabase.storage.listBuckets();
    if (getError) throw getError;

    if (!buckets?.find((b) => b.id === bucket)) {
      const { error: createError } = await supabase.storage.createBucket(bucket, {
        public: true,
      });
      if (createError) throw createError;
    }
  },
};
