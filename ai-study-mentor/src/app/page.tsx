import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import MainContent from "@/components/layout/MainContent";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Header />
      <div className="flex">
        <Sidebar />
        <MainContent />
      </div>
    </div>
  );
}
