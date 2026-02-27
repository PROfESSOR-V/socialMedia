package com.professor.socialMedia.controler;

import com.professor.socialMedia.dto.request.CreateProductRequest;
import com.professor.socialMedia.dto.ProductDto;
import com.professor.socialMedia.dto.request.UpdateProductRequest;
import com.professor.socialMedia.dto.mapper.ProductMapper;
import com.professor.socialMedia.dto.response.ApiResponse;
import com.professor.socialMedia.entity.Product;
import com.professor.socialMedia.service.ProductService;
import jakarta.validation.Valid;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
public class ProductControler {

    @Autowired
    private ProductService productService;

    @Autowired
    private ProductMapper productMapper;

    /**
     * Get all active products - PUBLIC endpoint
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ProductDto>>> listAllProducts() {
        List<Product> all = productService.findAllActive();
        List<ProductDto> dto = all.stream()
                .map(productMapper::mapProduct)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Products retrieved successfully", dto));
    }

    /**
     * Get all products (including disabled) - ADMIN only
     */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ProductDto>>> listAllAdminProducts() {
        List<Product> all = productService.findAll();
        List<ProductDto> dto = all.stream()
                .map(productMapper::mapProduct)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("Products retrieved successfully", dto));
    }

    /**
     * Get product by ID - PUBLIC endpoint
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductDto>> getProductById(@PathVariable ObjectId id) {
        return productService.findById(id)
                .map(product -> ResponseEntity.ok(
                        ApiResponse.success("Product retrieved successfully",
                                productMapper.mapProduct(product))))
                .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                        ApiResponse.error("Product not found")));
    }

    /**
     * Create a new product - ADMIN only
     */
    @PostMapping("/add")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductDto>> createProduct(
            @Valid @RequestBody CreateProductRequest request) {

        Product product = new Product();
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCurrency(request.getCurrency());
        product.setStock(request.getStock());
        product.setMainImage(request.getMainImage());
        product.setHoverImage(request.getHoverImage());
        product.setImages(request.getImages());

        product.setBenefits(request.getBenefits());
        product.setIngredients(request.getIngredients());
        product.setHowToUse(request.getHowToUse());
        product.setCategoryId(new ObjectId(request.getCategoryId()));
        product.setVariants(request.getVariants());

        Product created = productService.create(product);
        ProductDto productDto = productMapper.mapProduct(created);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.success("Product created successfully", productDto));
    }

    /**
     * Update product - ADMIN only
     */
    @PutMapping("/update/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProductDto>> updateProduct(
            @PathVariable ObjectId id,
            @Valid @RequestBody UpdateProductRequest request) {

        Product product = productService.findById(id).orElse(null);
        if (product == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    ApiResponse.error("Product not found"));
        }

        // Update only provided fields
        if (request.getName() != null) {
            product.setName(request.getName());
        }
        if (request.getDescription() != null) {
            product.setDescription(request.getDescription());
        }
        if (request.getPrice() != null) {
            product.setPrice(request.getPrice());
        }
        if (request.getCurrency() != null) {
            product.setCurrency(request.getCurrency());
        }
        if (request.getStock() != null) {
            product.setStock(request.getStock());
        }
        if (request.getMainImage() != null) {
            product.setMainImage(request.getMainImage());
        }
        if (request.getHoverImage() != null) {
            product.setHoverImage(request.getHoverImage());
        }
        if (request.getImages() != null) {
            product.setImages(request.getImages());
        }

        if (request.getBenefits() != null) {
            product.setBenefits(request.getBenefits());
        }
        if (request.getIngredients() != null) {
            product.setIngredients(request.getIngredients());
        }
        if (request.getHowToUse() != null) {
            product.setHowToUse(request.getHowToUse());
        }
        if (request.getCategoryId() != null) {
            product.setCategoryId(new ObjectId(request.getCategoryId()));
        }
        if (request.getVariants() != null) {
            product.setVariants(request.getVariants());
        }

        Product updated = productService.update(product);
        ProductDto productDto = productMapper.mapProduct(updated);

        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", productDto));
    }

    /**
     * Disable/Enable product - ADMIN only
     */
    @PutMapping("/disable/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> toggleProductStatus(@PathVariable ObjectId id) {
        Product product = productService.findById(id).orElse(null);
        if (product == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    ApiResponse.error("Product not found"));
        }
        productService.disable(id);
        return ResponseEntity.ok(ApiResponse.success("Product status toggled successfully", null));
    }

    /**
     * Hard Delete product - ADMIN only
     */
    @DeleteMapping("/del/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable ObjectId id) {
        Product product = productService.findById(id).orElse(null);
        if (product == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    ApiResponse.error("Product not found"));
        }
        productService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully", null));
    }

}
