import {Schema, model} from 'mongoose'
import bcrypt from "bcryptjs"


const veterinarioSchema = new Schema({
    nombre:{
        type:String,
        require:true,
        trim:true
    },
    apellido:{
        type:String,
        require:true,
        trim:true
    },
    direccion:{
        type:String,
        trim:true,
        default:null
    },
    celular:{
        type:String,
        trim:true,
        default:null
    },
    email:{
        type:String,
        require:true,
        trim:true,
				unique:true
    },
    password:{
        type:String,
        require:true
    },
    status:{
        type:Boolean,
        default:true
    },
    token:{
        type:String,
        default:null
    },
    confirmEmail:{
        type:Boolean,
        default:false
    },
    rol:{
        type:String,
        default:"veterinario"
    }

},{
    timestamps:true
})

//Metodo para cifrar el password del veterinario
veterinarioSchema.methods.encryPassword = async function(password){
    const salt = await bcrypt.genSalt(10)
    const passwordEncryp = await bcrypt.hash(password,salt)
    return passwordEncryp
}
//Metodo para verificar el password es el mismo que la BDD
veterinarioSchema.methods.matchPassword = async function(password) {
    const response = bcrypt.compare(password, this.password)
    return response
}

//Metodo para crear un token
veterinarioSchema.methods.crearToken = function(){
    const tokenGenerado = this.token = Math.random().toString(36).slice(2)
    return tokenGenerado
}

export default model('Veterinario',veterinarioSchema)