import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// Wraps every customer-facing page with the shared navbar + footer.
// Kept separate from AdminLayout so admin screens never render the
// customer chrome (and vice versa).
export default function CustomerLayout() {
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
