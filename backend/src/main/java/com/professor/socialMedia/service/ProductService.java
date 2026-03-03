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

    public Product create(Product product) {
        return productRepository.save(product);
    }

    public Optional<Product> findById(ObjectId id) {
        return productRepository.findById(id);
    }

    public List<Product> findAllActive() {
        return productRepository.findByActiveTrueOrderByPriorityDesc();
    }

    public List<Product> findAll() {
        return productRepository.findAllByOrderByPriorityDesc();
    }

    public Product update(Product product) {
        return productRepository.save(product);
    }

    public void disable(ObjectId id) {
        Product product = productRepository.findById(id).orElseThrow();
        product.setActive(!product.getActive()); // Toggle active status
        productRepository.save(product);
    }

    public void delete(ObjectId id) {
        productRepository.deleteById(id);
    }

}
