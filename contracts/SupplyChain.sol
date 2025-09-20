// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SupplyChain {
    enum ProductStatus { Harvested, AtDistributor, AtRetailer, Sold }
    enum StakeholderRole { Farmer, Distributor, Retailer, Consumer }
    
    struct Product {
        uint256 id;
        string name;
        string variety;
        uint256 quantity;
        string farmLocation;
        uint256 harvestDate;
        string qualityGrade;
        ProductStatus status;
        address farmer;
        string dataHash;
        bool exists;
    }
    
    struct Transaction {
        uint256 productId;
        address from;
        address to;
        ProductStatus newStatus;
        string location;
        uint256 timestamp;
        string transactionType;
        string additionalData;
    }
    
    struct Stakeholder {
        address walletAddress;
        StakeholderRole role;
        string name;
        string organization;
        bool isRegistered;
    }
    
    mapping(uint256 => Product) public products;
    mapping(uint256 => Transaction[]) public productTransactions;
    mapping(address => Stakeholder) public stakeholders;
    
    uint256 public productCounter;
    
    event ProductRegistered(
        uint256 indexed productId,
        string name,
        address indexed farmer,
        uint256 harvestDate
    );
    
    event ProductTransferred(
        uint256 indexed productId,
        address indexed from,
        address indexed to,
        ProductStatus newStatus,
        uint256 timestamp
    );
    
    event StakeholderRegistered(
        address indexed stakeholder,
        StakeholderRole role,
        string name
    );
    
    modifier onlyRegistered() {
        require(stakeholders[msg.sender].isRegistered, "Not a registered stakeholder");
        _;
    }
    
    modifier onlyRole(StakeholderRole _role) {
        require(stakeholders[msg.sender].role == _role, "Unauthorized role");
        _;
    }
    
    modifier productExists(uint256 _productId) {
        require(products[_productId].exists, "Product does not exist");
        _;
    }
    
    function registerStakeholder(
        StakeholderRole _role,
        string memory _name,
        string memory _organization
    ) public {
        require(!stakeholders[msg.sender].isRegistered, "Already registered");
        
        stakeholders[msg.sender] = Stakeholder({
            walletAddress: msg.sender,
            role: _role,
            name: _name,
            organization: _organization,
            isRegistered: true
        });
        
        emit StakeholderRegistered(msg.sender, _role, _name);
    }
    
    function registerProduct(
        string memory _name,
        string memory _variety,
        uint256 _quantity,
        string memory _farmLocation,
        uint256 _harvestDate,
        string memory _qualityGrade,
        string memory _dataHash
    ) public onlyRegistered onlyRole(StakeholderRole.Farmer) returns (uint256) {
        productCounter++;
        uint256 productId = productCounter;
        
        products[productId] = Product({
            id: productId,
            name: _name,
            variety: _variety,
            quantity: _quantity,
            farmLocation: _farmLocation,
            harvestDate: _harvestDate,
            qualityGrade: _qualityGrade,
            status: ProductStatus.Harvested,
            farmer: msg.sender,
            dataHash: _dataHash,
            exists: true
        });
        
        // Record initial transaction
        productTransactions[productId].push(Transaction({
            productId: productId,
            from: address(0),
            to: msg.sender,
            newStatus: ProductStatus.Harvested,
            location: _farmLocation,
            timestamp: block.timestamp,
            transactionType: "harvest",
            additionalData: _dataHash
        }));
        
        emit ProductRegistered(productId, _name, msg.sender, _harvestDate);
        
        return productId;
    }
    
    function transferProduct(
        uint256 _productId,
        address _to,
        ProductStatus _newStatus,
        string memory _location,
        string memory _transactionType,
        string memory _additionalData
    ) public onlyRegistered productExists(_productId) {
        Product storage product = products[_productId];
        
        // Verify ownership or authorized transfer
        if (product.status == ProductStatus.Harvested) {
            require(msg.sender == product.farmer, "Only farmer can transfer harvested product");
            require(stakeholders[_to].role == StakeholderRole.Distributor, "Can only transfer to distributor");
        } else if (product.status == ProductStatus.AtDistributor) {
            require(stakeholders[msg.sender].role == StakeholderRole.Distributor, "Only distributor can transfer");
            require(stakeholders[_to].role == StakeholderRole.Retailer, "Can only transfer to retailer");
        } else if (product.status == ProductStatus.AtRetailer) {
            require(stakeholders[msg.sender].role == StakeholderRole.Retailer, "Only retailer can sell");
        }
        
        product.status = _newStatus;
        
        productTransactions[_productId].push(Transaction({
            productId: _productId,
            from: msg.sender,
            to: _to,
            newStatus: _newStatus,
            location: _location,
            timestamp: block.timestamp,
            transactionType: _transactionType,
            additionalData: _additionalData
        }));
        
        emit ProductTransferred(_productId, msg.sender, _to, _newStatus, block.timestamp);
    }
    
    function getProduct(uint256 _productId) public view productExists(_productId) returns (Product memory) {
        return products[_productId];
    }
    
    function getProductTransactions(uint256 _productId) public view productExists(_productId) returns (Transaction[] memory) {
        return productTransactions[_productId];
    }
    
    function getStakeholder(address _address) public view returns (Stakeholder memory) {
        return stakeholders[_address];
    }
    
    function isProductAuthentic(uint256 _productId, string memory _dataHash) public view productExists(_productId) returns (bool) {
        return keccak256(abi.encodePacked(products[_productId].dataHash)) == keccak256(abi.encodePacked(_dataHash));
    }
    
    function getProductsByFarmer(address _farmer) public view returns (uint256[] memory) {
        uint256[] memory farmerProducts = new uint256[](productCounter);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= productCounter; i++) {
            if (products[i].farmer == _farmer && products[i].exists) {
                farmerProducts[count] = i;
                count++;
            }
        }
        
        // Resize array to actual count
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = farmerProducts[i];
        }
        
        return result;
    }
}