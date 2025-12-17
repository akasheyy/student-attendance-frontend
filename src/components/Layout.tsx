import Navbar from "./Navbar";

interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  return (
    <>
      <Navbar />
      <main className="p-6 text-gray-800 bg-gray-100 min-h-screen">
        {children}
      </main>
    </>
  );
};

export default Layout;
