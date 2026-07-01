import unittest
from unittest.mock import patch, MagicMock
import json
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '../mqtt-client/edge-workers'))

import edgebridge_calcetto

class TestEdgeBridgeCalcetto(unittest.TestCase):

    def setUp(self):
        # Reset stato partita prima di ogni test
        edgebridge_calcetto.PARTITA_ATTIVA = None

    def test_on_message_comando_avvio(self):
        # Mock client MQTT
        mock_client = MagicMock()
        
        # Mock msg
        mock_msg = MagicMock()
        mock_msg.topic = edgebridge_calcetto.MQTT_TOPIC_COMANDI
        payload = {"nuova_partita_id": 99}
        mock_msg.payload = json.dumps(payload).encode('utf-8')
        
        edgebridge_calcetto.on_message(mock_client, None, mock_msg)
        
        self.assertEqual(edgebridge_calcetto.PARTITA_ATTIVA, 99)
        # Verifica che sia stato inviato il reset ad Arduino
        mock_client.publish.assert_called_with(f"calcetto/{edgebridge_calcetto.ID_TAVOLO_ARDUINO}/reset", "1")

    def test_on_message_comando_termina(self):
        edgebridge_calcetto.PARTITA_ATTIVA = 99
        mock_client = MagicMock()
        
        mock_msg = MagicMock()
        mock_msg.topic = edgebridge_calcetto.MQTT_TOPIC_COMANDI
        payload = {"termina_partita": True}
        mock_msg.payload = json.dumps(payload).encode('utf-8')
        
        edgebridge_calcetto.on_message(mock_client, None, mock_msg)
        
        self.assertIsNone(edgebridge_calcetto.PARTITA_ATTIVA)

    @patch('edgebridge_calcetto.requests.put')
    def test_on_message_goal_registra(self, mock_put):
        # Setup: c'è una partita attiva
        edgebridge_calcetto.PARTITA_ATTIVA = 100
        
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_put.return_value = mock_response

        mock_client = MagicMock()
        mock_msg = MagicMock()
        mock_msg.topic = edgebridge_calcetto.MQTT_TOPIC_GOAL
        mock_msg.payload = b"A"
        
        edgebridge_calcetto.on_message(mock_client, None, mock_msg)
        
        mock_put.assert_called_once()
        args, kwargs = mock_put.call_args
        self.assertTrue(str(edgebridge_calcetto.PARTITA_ATTIVA) in args[0])
        self.assertEqual(kwargs['params']['idSquadra'], edgebridge_calcetto.MAPPA_SQUADRE["A"])

    @patch('edgebridge_calcetto.requests.put')
    def test_on_message_goal_ignored_when_no_match(self, mock_put):
        edgebridge_calcetto.PARTITA_ATTIVA = None
        
        mock_client = MagicMock()
        mock_msg = MagicMock()
        mock_msg.topic = edgebridge_calcetto.MQTT_TOPIC_GOAL
        mock_msg.payload = b"A"
        
        edgebridge_calcetto.on_message(mock_client, None, mock_msg)
        
        mock_put.assert_not_called()

if __name__ == '__main__':
    unittest.main()
