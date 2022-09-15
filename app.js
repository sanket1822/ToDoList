const express = require("express");
const bodyParser =  require("body-parser");
const mongoose =  require("mongoose");
const ejs =  require("ejs");
const _ = require("lodash");
const app = express();



app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

// mongoose connection established

mongoose.connect("mongodb+srv://admin-sanket:Shrey%4024@cluster0.42mrd8a.mongodb.net/todolistData", {useNewUrlParser: true});


// Today(route page) Page schema  created

const itemsSchema =  {
  name: String
}

const Item =  mongoose.model("Item", itemsSchema);



//  defaultItems created

const item1 = new Item({
  name:"Welcome to your todolist"
})

const item2 = new Item({
  name:"Hit + button to add new item"
})

const item3 = new Item({
  name:"<-- Hit this to delete the item"
})

const defaultItems = [item1, item2, item3];


// Home route get method

app.get ("/", function(req, res){
  Item.find({}, function(err, foundItems){


    if(foundItems.length === 0){

      Item.insertMany(defaultItems, function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Default items Added Successfully");
        }
      })

      res.redirect("/");
    }else{
      res.render("list",{listTitle: "Today",newListItems : foundItems });
    }

  })
});


// Home page post method

app.post("/",function(req, res){

  const newItemCreated = req.body.newItem;
  const  listName = req.body.list;

  const item =new Item ({
    name: newItemCreated
  })

  if(listName === "Today"){

    item.save();
    res.redirect("/");
  }else{

    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ listName);
    });
  }
});


// delete route post method


app.post("/delete", function(req, res){
  const itemSelectToDelete = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    Item.findByIdAndRemove(itemSelectToDelete, function(err){
      if(!err){
        console.log("Successfully deleted the Item");
        res.redirect("/");
      }
    })
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items: {_id: itemSelectToDelete}}}, function(err, foundedList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }
})


// Customepage  items schema

const listSchema ={
  name: String,
  items : [itemsSchema]
}

const List = mongoose.model("List", listSchema);

// Custome page get method


app.get("/:customeName", function(req, res){
  const customeName = _.capitalize(req.params.customeName);

  List.findOne({name:customeName}, function(err, foundListItems){
    if(!err){
      if(!foundListItems){
        const list = new List({
          name:customeName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customeName);

      }else{
        res.render("list",{listTitle: foundListItems.name , newListItems : foundListItems.items });
      }
    }
  })
})


app.listen(2000, function(){
  console.log("Server started running on Port 2000");
});
