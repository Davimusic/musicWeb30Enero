import { connectToDatabase } from './connectToDatabase';

export default async function getAllDAWSampleCategories(req, res) {
  try {
    const { user } = req.body;
    
    if (!user || !user.email) {
      return res.status(400).json({
        success: false,
        message: "User information is required"
      });
    }

    const db = await connectToDatabase();
    const collection = db.collection('SamplesCollection');

    const container = await collection.findOne({ _id: "samplesContainer" });

    const publicCategories = container?.publicSamples 
      ? Object.keys(container.publicSamples) 
      : [];

    const personalCategories = container?.userSamples?.[user.email]?.personal
      ? Object.keys(container.userSamples[user.email].personal)
      : [];

    return res.status(200).json({
      success: true,
      publicCategories,
      personalCategories
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}