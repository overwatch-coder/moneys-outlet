const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <section className="md:flex md:flex-col md:items-center">
      {children}
    </section>
  );
};

export default RootLayout;
