//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
mongoose.connect("mongodb+srv://admin-rushil:Test123@cluster0.mnubf3m.mongodb.net/todolistDB",{useNewUrlParser: true});

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name: "Welcome to todolist!"
});
const item2 = new Item({
  name: "Hit the + button to add a new item"
});
const item3 = new Item({
  name: "<--------Hit this to delete an item"
});

const defaultitems = [item1,item2,item3];

app.get("/", function(req, res) {
  Item.find({},(err,founditems)=>{
      if(founditems.length === 0){
        Item.insertMany(defaultitems,(err)=>{
          if(err){
            console.log(err);
          }
          else{
            console.log("Suceessfully saved default item to DB");
          }
        });
        res.redirect("/");
      }
      else{
      res.render("list", {listTitle: "Today", newListItems: founditems});
      }
  })
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List",listSchema);

app.get("/:customlistname",(req,res)=>{
  const customlistname = _.capitalize(req.params.customlistname);
  List.findOne({name: customlistname},(err,foundList)=>{
    if(err){
      console.log(err);
    }
    else{
      if(!foundList){
        const list = new List({
          name: customlistname,
          items: defaultitems
        });
        list.save();
        res.redirect("/" + customlistname);
      }
      else{
        res.render("list",{listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });
});


app.post("/", function(req, res){

  const itemname = req.body.newItem;
  const listname = req.body.list;
  const item = new Item({
    name: itemname
  });

  if(listname == "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listname},(err,foundlist)=>{
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/" + listname);
    });

  }
});


app.post("/delete",(req,res)=>{
  const checkitemid = req.body.checkbox;
  const listname = req.body.listname;

  if(listname === "Today"){
    Item.findByIdAndRemove(checkitemid,(err)=>{
      if(err){
        console.log(err);
      }
      else{
        console.log("deleted successfully!!");
      }
      res.redirect("/");
    })
  }
  else{
    List.findOneAndUpdate({name: listname},{$pull: {items: {_id: checkitemid}}},(err,foundlist)=>{
      if(err){
        console.log(err);
      }
      else{
        res.redirect("/" + listname);
      }
    })
  }
});


app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
