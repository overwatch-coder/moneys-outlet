export async function uploadImage(file: File, bucket: 'products' | 'brands' = 'products'): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', bucket);

  const res = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  if (!res.ok || !data.url) {
    throw new Error(data.error || 'Failed to upload image');
  }

  return data.url;
}
