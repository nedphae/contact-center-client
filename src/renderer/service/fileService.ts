import { getUploadS3ChatPath } from 'renderer/config/clientConfig';

export async function uploadFile(file: File): Promise<string[] | null> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch(getUploadS3ChatPath(), {
    method: 'POST',
    body: formData,
  });
  const responseJson = await response.json();
  return responseJson as string[] | null;
}
