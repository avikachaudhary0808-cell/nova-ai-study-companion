import { Routes, Route } from "react-router-dom";

import MainLayout from "./components/MainLayout.jsx";
import DashboardLayout from "./components/DashboardLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import Notes from "./pages/Notes.jsx";
import Files from "./pages/Files.jsx";
import AIPage from "./pages/AIPage.jsx";
import Flashcards from "./pages/Flashcards.jsx";
import QuizPlayer from "./pages/QuizPlayer.jsx";
import QuizHistory from "./pages/QuizHistory.jsx";
import StudyPlanner from "./pages/StudyPlanner.jsx";
import Analytics from "./pages/Analytics.jsx";
import Settings from "./pages/Settings.jsx";
import Help from "./pages/Help.jsx";
import Mydecks from "./pages/Mydecks.jsx";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>

      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
      </Route>

      {/* My Decks */}
      <Route
        path="/dashboard/decks"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Mydecks />} />
      </Route>

      {/* Notes */}
      <Route
        path="/dashboard/notes"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Notes />} />
      </Route>

      {/* Files */}
      <Route
        path="/dashboard/files"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Files />} />
      </Route>

      {/* AI */}
      <Route
        path="/dashboard/generate"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AIPage />} />
      </Route>

      {/* Flashcards */}
      <Route
        path="/dashboard/flashcards"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Flashcards />} />
      </Route>

      {/* Quiz */}
      <Route
        path="/dashboard/quiz"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<QuizPlayer />} />
        <Route path="history" element={<QuizHistory />} />
      </Route>

      {/* Planner */}
      <Route
        path="/dashboard/planner"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudyPlanner />} />
      </Route>

      {/* Analytics */}
      <Route
        path="/dashboard/analytics"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Analytics />} />
      </Route>

      {/* Settings */}
      <Route
        path="/dashboard/settings"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Settings />} />
      </Route>

      {/* Help */}
      <Route
        path="/dashboard/help"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Help />} />
      </Route>

      {/* Profile */}
      <Route
        path="/dashboard/profile"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Profile />} />
      </Route>
    </Routes>
  );
}

export default App;