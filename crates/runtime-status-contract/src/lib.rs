use serde_json::Value;
use std::fs;
use std::path::{Path, PathBuf};

const REQUIRED_FIELDS: &[&str] = &[
    "runtimeId",
    "rendererGraphEpoch",
    "graphStatus",
    "authoritativeWindowId",
    "liveTabCount",
    "liveLeafCount",
    "runtimeProtocolVersion",
    "minCompatibleRuntimeClientVersion",
    "capabilities",
    "hostPlatform",
];

fn repository_root() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR"))
        .ancestors()
        .nth(2)
        .expect("runtime-status-contract crate must live under crates/")
        .to_path_buf()
}

fn load_json(relative_path: &str) -> Value {
    let path = repository_root().join(relative_path);
    let source = fs::read_to_string(&path)
        .unwrap_or_else(|error| panic!("failed to read {}: {error}", path.display()));

    serde_json::from_str(&source)
        .unwrap_or_else(|error| panic!("failed to parse {}: {error}", path.display()))
}

fn missing_runtime_status_fields(value: &Value) -> Vec<&'static str> {
    REQUIRED_FIELDS
        .iter()
        .copied()
        .filter(|field| value.get(field).is_none())
        .collect()
}

pub fn validate_runtime_status_sample(relative_path: &str) -> Result<(), Vec<&'static str>> {
    let value = load_json(relative_path);
    let missing_fields = missing_runtime_status_fields(&value);

    if missing_fields.is_empty() {
        Ok(())
    } else {
        Err(missing_fields)
    }
}

fn validation_result_json(result: Result<(), Vec<&'static str>>) -> Value {
    match result {
        Ok(()) => serde_json::json!({ "ok": true }),
        Err(missing_fields) => serde_json::json!({
            "ok": false,
            "missingFields": missing_fields,
        }),
    }
}

pub fn verify_runtime_status_sample_manifest(relative_path: &str) -> Result<(), String> {
    let manifest = load_json(relative_path);
    let samples = manifest
        .get("samples")
        .and_then(Value::as_array)
        .ok_or_else(|| "sample manifest must include a samples array".to_string())?;

    for sample in samples {
        let path = sample
            .get("path")
            .and_then(Value::as_str)
            .ok_or_else(|| "sample entry must include a string path".to_string())?;
        let expected_result = sample
            .get("expectedResult")
            .ok_or_else(|| format!("sample {path} must include expectedResult"))?;
        let actual_result = validation_result_json(validate_runtime_status_sample(path));

        if &actual_result != expected_result {
            return Err(format!(
                "sample {path} expected {expected_result} but got {actual_result}"
            ));
        }
    }

    Ok(())
}

pub fn verify_runtime_status_manifest_id(
    relative_path: &str,
    expected_artifact_id: &str,
) -> Result<(), String> {
    let manifest = load_json(relative_path);
    let actual_artifact_id = manifest
        .get("artifactId")
        .and_then(Value::as_str)
        .ok_or_else(|| "sample manifest must include a string artifactId".to_string())?;

    if actual_artifact_id == expected_artifact_id {
        Ok(())
    } else {
        Err(format!(
            "sample manifest expected artifactId {expected_artifact_id} but got {actual_artifact_id}"
        ))
    }
}

pub fn verify_runtime_status_manifest_method(
    relative_path: &str,
    expected_method: &str,
) -> Result<(), String> {
    let manifest = load_json(relative_path);
    let actual_method = manifest
        .get("contractMethod")
        .and_then(Value::as_str)
        .ok_or_else(|| "sample manifest must include a string contractMethod".to_string())?;

    if actual_method == expected_method {
        Ok(())
    } else {
        Err(format!(
            "sample manifest expected contractMethod {expected_method} but got {actual_method}"
        ))
    }
}

pub fn verify_runtime_status_manifest_artifact_id(
    relative_path: &str,
    expected_artifact_id: &str,
) -> Result<(), String> {
    let manifest = load_json(relative_path);
    let actual_artifact_id = manifest
        .get("contractArtifactId")
        .and_then(Value::as_str)
        .ok_or_else(|| "sample manifest must include a string contractArtifactId".to_string())?;

    if actual_artifact_id == expected_artifact_id {
        Ok(())
    } else {
        Err(format!(
            "sample manifest expected contractArtifactId {expected_artifact_id} but got {actual_artifact_id}"
        ))
    }
}

#[cfg(test)]
mod tests {
    use super::{
        validate_runtime_status_sample, verify_runtime_status_manifest_artifact_id,
        verify_runtime_status_manifest_id, verify_runtime_status_manifest_method,
        verify_runtime_status_sample_manifest,
    };

    #[test]
    fn accepts_the_checked_in_valid_runtime_status_sample() {
        assert_eq!(
            validate_runtime_status_sample("src/shared/runtime-status-contract-valid-sample.json"),
            Ok(())
        );
    }

    #[test]
    fn rejects_the_checked_in_invalid_runtime_status_sample() {
        assert_eq!(
            validate_runtime_status_sample(
                "src/shared/runtime-status-contract-invalid-sample.json"
            ),
            Err(vec!["runtimeId"])
        );
    }

    #[test]
    fn verifies_every_sample_listed_in_the_checked_in_manifest() {
        assert_eq!(
            verify_runtime_status_sample_manifest(
                "src/shared/runtime-status-contract-samples.json"
            ),
            Ok(())
        );
    }

    #[test]
    fn verifies_the_checked_in_manifest_identifies_the_runtime_status_samples() {
        assert_eq!(
            verify_runtime_status_manifest_id(
                "src/shared/runtime-status-contract-samples.json",
                "janus-runtime-status-contract-samples"
            ),
            Ok(())
        );
    }

    #[test]
    fn verifies_the_checked_in_manifest_targets_status_get() {
        assert_eq!(
            verify_runtime_status_manifest_method(
                "src/shared/runtime-status-contract-samples.json",
                "status.get"
            ),
            Ok(())
        );
    }

    #[test]
    fn verifies_the_checked_in_manifest_targets_the_runtime_status_contract_artifact() {
        assert_eq!(
            verify_runtime_status_manifest_artifact_id(
                "src/shared/runtime-status-contract-samples.json",
                "janus-runtime-status-contract"
            ),
            Ok(())
        );
    }
}
