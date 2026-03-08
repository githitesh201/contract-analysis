export default function PrivacyPage() {
  return (
    <main className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="space-y-4 text-muted-foreground">
        <p>
          This demo application stores account and contract analysis data to
          provide dashboard functionality.
        </p>
        <p>
          Uploaded documents are processed to extract text and generate
          analysis. Do not upload sensitive production documents in demo mode.
        </p>
        <p>
          For local development, third-party services may be mocked or disabled.
        </p>
      </div>
    </main>
  );
}
