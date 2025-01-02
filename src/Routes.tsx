import { Routes as RouterRoutes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import SavedNews from "./pages/SavedNews";
import Search from "./pages/Search";
import Categories from "./pages/Categories";
import ArticleForm from "./pages/admin/ArticleForm";
import Articles from "./pages/admin/Articles";
import Dashboard from "./pages/admin/Dashboard";
import AdminRoute from "./components/AdminRoute";

export default function Routes() {
  return (
    <RouterRoutes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/saved" element={<SavedNews />} />
      <Route path="/search" element={<Search />} />
      <Route path="/categories" element={<Categories />} />
      
      {/* Admin routes */}
      <Route path="/admin" element={<AdminRoute />}>
        <Route index element={<Dashboard />} />
        <Route path="articles" element={<Articles />} />
        <Route path="articles/new" element={<ArticleForm />} />
        <Route path="articles/:id/edit" element={<ArticleForm />} />
      </Route>
    </RouterRoutes>
  );
}
