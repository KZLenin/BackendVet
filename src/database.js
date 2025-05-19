//ODM === NoSQL === MongoDB
//Servidor === ODM === Mongoose
import moongose from 'mongoose' 

moongose.set('strictQuery', true)

const connection = async() =>{
    try {
        await moongose.connect(process.env.MONGODB_URI_LOCAL)
        console.log("Database is connected")
    } catch (error) {
        console.log(error)
    }
}

export default connection