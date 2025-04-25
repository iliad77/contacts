import {Router} from "express";




const router = Router()

router.post("/api/cart",(request,response)=>{
    if (!request.session.user) return response.status(401).send({msg:"Unauthorize"});
    const {body} = request;
    const {cart} = request.session;
    if (cart){
        cart.push(body);
    } else {
        request.session.cart = [body]
    };
    return response.status(200).send(request.session.cart)
})

router.get("/api/cart",(request,response) => {
    if(!request.session.user) return response.sendStatus(401);
    response.status(200).send(request.session.cart ?? "nothing")
})
export default router;