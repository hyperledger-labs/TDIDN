// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract IMEIBlacklist {
    // Enum to represent IMEI status
    enum IMEIStatus { Uninitialized, Whitelist, Greylist, Blacklist}

    // Struct to represent an IMEI entry
    struct IMEIEntry {
        IMEIStatus status;
        string ownerDID;
    }

    // Mapping of IMEI numbers to their respective entries
    mapping(uint256 => IMEIEntry) private imeiRegistry;

    // Mapping of authorized addresses
    mapping(address => bool) private authorizedAddresses;

    modifier onlyAuthorized() {
        require(isAuthorized(msg.sender), "Only authorized users can perform this action");
        _;
    }

    constructor(address _initialAuthorizedAddresses) {
        authorizedAddresses[_initialAuthorizedAddresses] = true;
    }

    // Check if the sender's address is authorized
    function isAuthorized(address _address) internal view returns (bool) {
        return authorizedAddresses[_address];
    }

    // Add a new authorized address
    function addAuthorizedAddress(address _newAddress) external onlyAuthorized {
        authorizedAddresses[_newAddress] = true;
    }

    // Update the status of an IMEI entry
    function updateIMEIStatus(uint256 _imei, IMEIStatus _status, string memory _did) external onlyAuthorized {
        imeiRegistry[_imei].status = _status;
        imeiRegistry[_imei].ownerDID = _did;
    }

    // Get the status of an IMEI entry
    function getIMEIStatus(uint256 _imei) external view returns (string memory) {
        if (imeiRegistry[_imei].status == IMEIStatus.Blacklist) {
            return "Blacklist";
        } else if (imeiRegistry[_imei].status == IMEIStatus.Whitelist) {
            return "Whitelist";
        } else if (imeiRegistry[_imei].status == IMEIStatus.Greylist) {
            return "Greylist";
        }
        else {
            return "IMEI not found";
        }
    }

    function getOwnerDID(uint256 _imei) external view returns (string memory) {
        return imeiRegistry[_imei].ownerDID;
    }
}
