import mongoose from 'mongoose';

const connectDB = async (): Promise<void> => {
   try {
      const mongoURI = process.env.MONGODB_URI;

      if (!mongoURI) {
         throw new Error('MONGODB_URI is not defined in environment variables');
      }

      const conn = await mongoose.connect(mongoURI, {
         maxPoolSize: 10, // Maintain up to 10 socket connections
         serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
         socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
         // bufferMaxEntries: 0, // Disable mongoose buffering
         bufferCommands: false, // Disable mongoose buffering
      });

      console.log(`MongoDB Connected: ${conn.connection.host}`);

      // Handle connection events
      mongoose.connection.on('error', (err) => {
         console.error('MongoDB connection error:', err);
      });

      mongoose.connection.on('disconnected', () => {
         console.log('MongoDB disconnected');
      });

      mongoose.connection.on('reconnected', () => {
         console.log('MongoDB reconnected');
      });

      // Handle app termination
      process.on('SIGINT', async () => {
         try {
            await mongoose.connection.close();
            console.log('MongoDB connection closed through app termination');
            process.exit(0);
         } catch (error) {
            console.error('Error closing MongoDB connection:', error);
            process.exit(1);
         }
      });

   } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      process.exit(1);
   }
};

export default connectDB;
