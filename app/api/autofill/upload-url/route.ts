import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';

const getStorageClient = () => {
  const credentialsJson = process.env.GOOGLE_CREDENTIALS_JSON;
  const projectId = process.env.GOOGLE_PROJECT_ID;
  if (credentialsJson) {
    let credentials;
    try {
      credentials = JSON.parse(credentialsJson);
    } catch {
      credentials = JSON.parse(Buffer.from(credentialsJson, 'base64').toString('utf-8'));
    }
    return new Storage({ credentials, projectId });
  }
  return new Storage();
};

export async function POST(request: Request) {
  try {
    const { filename, contentType } = await request.json();

    if (!filename || !contentType) {
      return NextResponse.json(
        { error: 'filename and contentType are required' },
        { status: 400 }
      );
    }

    const bucketName = process.env.GCS_BUCKET_NAME || 'temporary-secure-uploads';
    const storage = getStorageClient();
    
    // Generate a unique filename to avoid collisions
    const uniqueFilename = `uploads/${Date.now()}-${crypto.randomUUID()}-${filename}`;

    const options = {
      version: 'v4' as const,
      action: 'write' as const,
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType: contentType,
    };

    const [signedUrl] = await storage
      .bucket(bucketName)
      .file(uniqueFilename)
      .getSignedUrl(options);

    const gcsUri = `gs://${bucketName}/${uniqueFilename}`;

    return NextResponse.json({ signedUrl, gcsUri });
  } catch (error) {
    console.error('Error generating signed URL:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}
