export default function getCSSVariableValue(variableName) {
    const root = document.documentElement;
    const styles = getComputedStyle(root);
    const value = styles.getPropertyValue(variableName);
    return value.trim();
}
