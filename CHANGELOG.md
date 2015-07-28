# Change Log
All notable changes to this project will be documented in this file.
This project adheres to [Autodesk Spark JS SDK](https://github.com/spark3dp/spark-js-SDK).

## [Unreleased][unreleased]

## [0.1.1] - 2015-07-28
### Added
- Add bower support
- Added comments handling methods
- Added toggle like support method
- Added support to upload files from URL

### Changed
- Allow using guest token calls with access token (for users that don't implement server with guest token endpoint with implicit login implementation)

## [0.1.0] - 2015-07-14
### Added
- Implicit login to simplify the login process
- Simpler Client initialization
- Added support for repairAll option in method repairMesh
- Added exportMesh method
- New Job methods for updating custom job data
- Support Bolt filetype

### Changed
- Move the storage of refresh_token from client (localStorage) to server (session)

## 0.0.2 - 2015-05-21
### Added
- Automatic building of SDK and documentation
- Server implementation for calling access, refresh and guest tokens to prevent the exposing of APP SECRET
- More tests coverage

### Changed
- Client authorized requests and guest authorized requests present a similar interface

### Removed
- Client.js and Request.js unit tests (will be added later)

### Fixed
- README links and instructions
- Code cleanup
- Added approved license

## 0.0.1 - 2015-04-20
### Added
- Generic interface for approaching API requests
- Partial Drive API implementation, mainly methods that involve working with private assets
- Some Print API implementation, mainly mesh related methods
- Added grunt to the SDK with initial build tasks

[unreleased]: https://github.com/spark3dp/spark-js-SDK/compare/v0.1.1...develop
[0.1.0]: https://github.com/spark3dp/spark-js-SDK/compare/v0.0.2...v0.1.0
