import Layout from '@/components/Layout';

const Dashboard = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
        <p>Welcome to your dashboard!</p>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">My Posts</h3>
            <p className="text-gray-600">0 posts</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Saved Posts</h3>
            <p className="text-gray-600">0 saved</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="text-lg font-semibold mb-2">Liked Posts</h3>
            <p className="text-gray-600">0 liked</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;