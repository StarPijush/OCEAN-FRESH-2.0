import { getEmoji, type ProductVM } from '../types/legacy.js';

const LEGACY_PRODUCTS: ProductVM[] = [
  { id:'1', name:'Rohu',             sub:'River Fish',        price:220, emoji:getEmoji('Rohu'), category:'fresh',  tag:'Popular',   available:true,  image:null },
  { id:'2', name:'Katla',            sub:'Bengal Favourite',  price:240, emoji:getEmoji('Katla'), category:'fresh',  tag:'Fresh',     available:true,  image:null },
  { id:'3', name:'Tiger Prawns',     sub:'Bay of Bengal',     price:650, emoji:getEmoji('Tiger Prawns'), category:'prawns', tag:'Premium', available:true,  image:null },
  { id:'4', name:'Prawns',           sub:'Farm Raised',       price:450, emoji:getEmoji('Prawns'), category:'prawns', tag:'Hot',       available:true,  image:null },
  { id:'5', name:'Pomfret',          sub:'Silver Pomfret',    price:380, emoji:getEmoji('Pomfret'), category:'sea',    tag:'Sea Fresh', available:true,  image:null },
  { id:'6', name:'Surmai',           sub:'King Fish',         price:420, emoji:getEmoji('Surmai'), category:'sea',    tag:'Premium',   available:true,  image:null },
  { id:'7', name:'Bombil',           sub:'Bombay Duck',       price:180, emoji:getEmoji('Bombil'), category:'fresh',  tag:'Local',     available:true,  image:null },
  { id:'8', name:'Crab',             sub:'Live Blue Crab',    price:550, emoji:getEmoji('Crab'), category:'crabs',  tag:'Live',      available:true,  image:null },
  { id:'9', name:'Mud Crab',         sub:'Mangrove Crab',     price:680, emoji:getEmoji('Mud Crab'), category:'crabs',  tag:'Fresh',     available:false, image:null },
  { id:'10',name:'Bangda',           sub:'Indian Mackerel',   price:160, emoji:getEmoji('Bangda'), category:'sea',    tag:'Daily',     available:true,  image:null },
  { id:'11',name:'Rawas',            sub:'Indian Salmon',     price:520, emoji:getEmoji('Rawas'), category:'sea',    tag:'Premium',   available:true,  image:null },
  { id:'12',name:'Hilsa',            sub:'River Shad',        price:700, emoji:getEmoji('Hilsa'), category:'fresh',  tag:'Seasonal',  available:true,  image:null },
];

export function getProducts(): ProductVM[] {
  return LEGACY_PRODUCTS;
}

export function getFeaturedProducts(limit = 6): ProductVM[] {
  return LEGACY_PRODUCTS.filter((p) => p.available).slice(0, limit);
}
