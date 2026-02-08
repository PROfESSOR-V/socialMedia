package com.professor.socialMedia.service;

import com.professor.socialMedia.entity.Product;
import com.professor.socialMedia.repository.ProductRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;


@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public Product create(Product product){
        return productRepository.save(product);
    }

    public Optional<Product> findById(ObjectId id){
        return productRepository.findById(id);
    }

    public List<Product> findAllActive(){
        return  productRepository.findByActiveTrue();
    }

    public Product update(Product product){
        return productRepository.save(product);
    }

    public void disable(ObjectId id){
        Product product = productRepository.findById(id).orElseThrow();
        product.setActive(false);
        productRepository.save(product);
    }



}
