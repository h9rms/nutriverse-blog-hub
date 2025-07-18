import Layout from '@/components/Layout';

const Dashboard = () => {
  return (
    <Layout>
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        <p className="text-gray-600 mb-8">Welcome to your dashboard!</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-2">My Posts</h3>
            <p className="text-2xl font-bold text-blue-600">0</p>
          </div>
          
          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Saved Posts</h3>
            <p className="text-2xl font-bold text-green-600">0</p>
          </div>
          
          <div className="bg-white border rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-2">Liked Posts</h3>
            <p className="text-2xl font-bold text-red-600">0</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;