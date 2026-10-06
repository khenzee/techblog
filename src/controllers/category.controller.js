
export const create = async (req, res) => { 
    try {
        const { name, description } = req.body
        
    } catch (error) {
         return res
           .status(500)
           .json({ message: " internal server error", error: error.message });
    }
}