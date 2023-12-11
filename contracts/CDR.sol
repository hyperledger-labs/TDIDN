// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract TelecomBilling {
    address[] private owners;

    enum ServiceType {
        Voice,
        Data,
        SMS
    }

    struct CallDetailRecord {
        string userDID;
        uint256 timestamp;
        ServiceType service;
        uint256 duration;
    }

    mapping(address => CallDetailRecord[]) private userCDRs;

    event CDRAdded(
        string indexed user,
        uint256 timestamp,
        ServiceType service,
        uint256 duration
    );

    modifier onlyOwner() {
        bool isOwner = false;
        for (uint256 i = 0; i < owners.length; i++) {
            if (msg.sender == owners[i]) {
                isOwner = true;
                break;
            }
        }
        require(isOwner, "Only owners can call this function");
        _;
    }

    constructor() {
        owners.push(msg.sender);
    }

    function addOwner(address newOwner) external onlyOwner {
        owners.push(newOwner);
    }

    function addCDR(
        string memory _userDID,
        uint256 _timestamp,
        ServiceType _service,
        uint256 _duration
    ) external onlyOwner {
        userCDRs[msg.sender].push(
            CallDetailRecord(_userDID, _timestamp, _service, _duration)
        );
        emit CDRAdded(_userDID, _timestamp, _service, _duration);
    }

    function calculateBill(string memory _userDID)
        external
        view
        onlyOwner
        returns (uint256)
    {
        CallDetailRecord[] memory cdrs = userCDRs[msg.sender];
        uint256 totalBill = 0;

        for (uint256 i = 0; i < cdrs.length; i++) {
            if (
                keccak256(bytes(cdrs[i].userDID)) == keccak256(bytes(_userDID))
            ) {
                if (cdrs[i].service == ServiceType.Voice) {
                    totalBill += cdrs[i].duration * 3; // Replace 3 with actual voice rate
                } else if (cdrs[i].service == ServiceType.Data) {
                    totalBill += cdrs[i].duration * 2; // Replace 2 with actual data rate
                } else if (cdrs[i].service == ServiceType.SMS) {
                    totalBill += cdrs[i].duration * 1; // Replace 1 with actual SMS rate
                }
            }
        }
        return totalBill;
    }

    function calculateTotalBill() external view onlyOwner returns (uint256) {
        CallDetailRecord[] memory cdrs = userCDRs[msg.sender];
        uint256 totalBill = 0;

        for (uint256 i = 0; i < cdrs.length; i++) {
            if (cdrs[i].service == ServiceType.Voice) {
                totalBill += cdrs[i].duration * 3; // Replace 3 with actual voice rate
            } else if (cdrs[i].service == ServiceType.Data) {
                totalBill += cdrs[i].duration * 2; // Replace 2 with actual data rate
            } else if (cdrs[i].service == ServiceType.SMS) {
                totalBill += cdrs[i].duration * 1; // Replace 1 with actual SMS rate
            }
        }
        return totalBill;
    }
}
