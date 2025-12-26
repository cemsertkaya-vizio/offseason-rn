import Foundation
import MapKit

@objc(MapKitSearchCompleter)
class MapKitSearchCompleter: NSObject, MKLocalSearchCompleterDelegate {
  
  private var completer: MKLocalSearchCompleter?
  private var promiseResolve: RCTPromiseResolveBlock?
  private var promiseReject: RCTPromiseRejectBlock?
  
  override init() {
    super.init()
  }
  
  private func setupCompleter() {
    if completer == nil {
      completer = MKLocalSearchCompleter()
      completer?.delegate = self
      completer?.resultTypes = .address
    }
  }
  
  @objc
  func search(_ query: String, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    
    if query.isEmpty {
      resolve([])
      return
    }
    
    DispatchQueue.main.async { [weak self] in
      guard let self = self else {
        reject("SEARCH_ERROR", "Module deallocated", nil)
        return
      }
      
      self.setupCompleter()
      self.promiseResolve = resolve
      self.promiseReject = reject
      self.completer?.queryFragment = query
    }
  }
  
  func completerDidUpdateResults(_ completer: MKLocalSearchCompleter) {
    let results = completer.results.prefix(10).map { result -> [String: String] in
      let title = result.title
      let subtitle = result.subtitle
      let fullText = subtitle.isEmpty ? title : "\(title), \(subtitle)"
      
      return [
        "id": UUID().uuidString,
        "title": title,
        "subtitle": subtitle,
        "fullText": fullText
      ]
    }
    
    promiseResolve?(results)
    promiseResolve = nil
    promiseReject = nil
  }
  
  func completer(_ completer: MKLocalSearchCompleter, didFailWithError error: Error) {
    promiseReject?("SEARCH_ERROR", error.localizedDescription, error)
    promiseResolve = nil
    promiseReject = nil
  }
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }
}
