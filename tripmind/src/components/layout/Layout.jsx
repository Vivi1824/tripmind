import Navbar from "./Navbar";

export default function Layout({ children }) {
  return (
    <div>
      <Navbar />
      <main className="max-w-5xl mx-auto p-4">{children}</main>
    </div>
  );
}