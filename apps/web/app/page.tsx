export default async function Home() {
  const res = await fetch('http://localhost:3000/reports', {
    cache: 'no-store',
  });
  const data = await res.json();

  return (
    <main>
      <h1>Flood Reports Testing</h1>
      <p>Displaying the latest flood reports fetched from the server.</p>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}