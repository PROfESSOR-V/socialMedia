package com.professor.socialMedia.service;

import com.professor.socialMedia.entity.Product;
import com.professor.socialMedia.repository.ProductRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @CacheEvict(value = "products", allEntries = true)
    public Product create(Product product) {
        return productRepository.save(product);
    }

    @Cacheable(value = "products", key = "#id")
    public Optional<Product> findById(ObjectId id) {
        return productRepository.findById(id);
    }

    @Cacheable(value = "products", key = "'allActive'")
    public List<Product> findAllActive() {
        return productRepository.findByActiveTrueOrderByPriorityDesc();
    }

    @Cacheable(value = "products", key = "'all'")
    public List<Product> findAll() {
        return productRepository.findAllByOrderByPriorityDesc();
    }

    @CacheEvict(value = "products", allEntries = true)
    public Product update(Product product) {
        return productRepository.save(product);
    }

    @CacheEvict(value = "products", allEntries = true)
    public void disable(ObjectId id) {
        Product product = productRepository.findById(id).orElseThrow();
        product.setActive(!product.getActive()); // Toggle active status
        productRepository.save(product);
    }

    @CacheEvict(value = "products", allEntries = true)
    public void delete(ObjectId id) {
        productRepository.deleteById(id);
    }

}
