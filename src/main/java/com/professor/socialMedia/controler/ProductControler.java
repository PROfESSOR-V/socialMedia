package com.professor.socialMedia.controler;


import com.professor.socialMedia.entity.Product;
import com.professor.socialMedia.service.ProductService;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductControler {

    @Autowired
    private ProductService productService;

    //all product now for all user
    @GetMapping
    public ResponseEntity<List<Product>> listAllProducts() {
        List<Product> all = productService.findAllActive();
        return new ResponseEntity<>(all, HttpStatus.OK);
    }

    //pruduct find by their product id
    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable ObjectId id) {
        return productService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    //create a new product only admin can do this
    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Product product){
        Product created =  productService.create(product);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable ObjectId id, @RequestBody Product newProduct){
        Product old = productService.findById(id).get();
        if(old != null){
            old.setName(newProduct.getName() != null ? newProduct.getName() : old.getName());
            old.setDescription(newProduct.getDescription() != null ? newProduct.getDescription() : old.getDescription());
            old.setPrice(newProduct.getPrice() != null ? newProduct.getPrice() : old.getPrice());
            old.setCurrency(newProduct.getCurrency() != null ? newProduct.getCurrency() : old.getCurrency());
            old.setStock(newProduct.getStock());
            old.setImages(newProduct.getImages() != null ? newProduct.getImages() : old.getImages());
            old.setCategoryId(newProduct.getCategoryId() != null ? newProduct.getCategoryId() : old.getCategoryId()) ;

            Product save =   productService.update(old);
            return new ResponseEntity<>(save, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);

    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void>  deleteProduct(@PathVariable ObjectId id){
        Product product = productService.findById(id).get();
        if(product != null){
            productService.disable(product.getId());
            return new ResponseEntity<>(HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }



}















