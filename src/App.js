import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { DataProvider } from "./context/DataContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Store from "./pages/Store";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import AdminPanel from "./pages/AdminPanel";
import "./styles.css";

function App() {
  return (
    <DataProvider>
      <Router>
        <Routes>
          {/* Secret admin route — no header/footer */}
          <Route path="/admin-enrama" element={<AdminPanel />} />

          {/* Public routes */}
          <Route
            path="/*"
            element={
              <>
                <Header />
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/tienda" element={<Store />} />
                  <Route path="/journal" element={<Blog />} />
                  <Route path="/journal/:id" element={<BlogPost />} />
                </Routes>
                <Footer />
              </>
            }
          />
        </Routes>
      </Router>
    </DataProvider>
  );
}

export default App;
